// functions/api/events.js
const ZWIFT_EVENTS_URL = 'https://us-or-rly101.zwift.com/api/public/events/upcoming?tags=inox';

const DAY_LABELS = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

const CATEGORY_BY_EVENT_TYPE = {
  RACE: 'Race',
  GROUP_RIDE: 'Social',
  GROUP_WORKOUT: 'Social',
  TIME_TRIAL: 'Race',
  TEAM_TIME_TRIAL: 'Race',
};

const mapItalianDayName = (date) => DAY_LABELS[date.getDay()] || 'Lunedì';

const toCETTime = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/Rome',
  }).format(date);
};

const toItalianDateLabel = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Rome',
  }).format(date);
};

const normalizeZwiftEvent = (event) => {
  const startDate = new Date(event.eventStart);

  return {
    id: Number(`9${event.id}`),
    source: 'zwift',
    name: event.name,
    day_of_week: mapItalianDayName(startDate),
    time: toCETTime(event.eventStart),
    description: event.description || '',
    zwift_link: `https://www.zwift.com/eu-it/events/tag/inox/view/${event.id}`,
    strava_segment_id: '',
    category: CATEGORY_BY_EVENT_TYPE[event.eventType] || 'Race',
    is_active: true,
    image_url: event.imageUrl || '',
    sport: event.sport || '',
    event_type: event.eventType || '',
    start_at: event.eventStart,
    date_label: toItalianDateLabel(event.eventStart),
    total_signed_up: event.totalSignedUpCount ?? 0,
    tags: Array.isArray(event.tags) ? event.tags : [],
  };
};

const sortEvents = (events) =>
  [...events].sort((first, second) => {
    const firstStart = first.start_at ? new Date(first.start_at).getTime() : 0;
    const secondStart = second.start_at ? new Date(second.start_at).getTime() : 0;

    if (firstStart && secondStart) {
      return firstStart - secondStart;
    }

    const dayOrder = {
      Lunedì: 1,
      Martedì: 2,
      Mercoledì: 3,
      Giovedì: 4,
      Venerdì: 5,
      Sabato: 6,
      Domenica: 7,
    };

    return (dayOrder[first.day_of_week] || 99) - (dayOrder[second.day_of_week] || 99) || String(first.time).localeCompare(String(second.time));
  });

const fetchManualEvents = async (env) => {
  const { results } = await env.ZRL_DB.prepare(
    "SELECT * FROM inox_events WHERE is_active = 1 ORDER BY CASE day_of_week WHEN 'Lunedì' THEN 1 WHEN 'Martedì' THEN 2 WHEN 'Mercoledì' THEN 3 WHEN 'Giovedì' THEN 4 WHEN 'Venerdì' THEN 5 WHEN 'Sabato' THEN 6 WHEN 'Domenica' THEN 7 END, time ASC"
  ).all();

  return results.map((event) => ({
    ...event,
    source: 'manual',
    image_url: '',
    sport: 'CYCLING',
    event_type: event.category || 'Race',
    start_at: null,
    date_label: event.day_of_week,
    total_signed_up: null,
    tags: [],
  }));
};

const fetchZwiftEvents = async () => {
  const response = await fetch(ZWIFT_EVENTS_URL, {
    headers: {
      'User-Agent': 'INOXTEAM Platform Events Sync',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Zwift upstream error: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(normalizeZwiftEvent);
};

export async function onRequestGet({ env }) {
  try {
    const [manualEvents, zwiftEvents] = await Promise.all([
      fetchManualEvents(env),
      fetchZwiftEvents().catch(() => []),
    ]);

    return new Response(JSON.stringify(sortEvents([...zwiftEvents, ...manualEvents])), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  // Il middleware garantisce che solo Admin/Moderator arrivino qui
  try {
    const { name, day_of_week, time, description, zwift_link, strava_segment_id, category } = await request.json();
    const result = await env.ZRL_DB.prepare(
      "INSERT INTO inox_events (name, day_of_week, time, description, zwift_link, strava_segment_id, category) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(name, day_of_week, time, description, zwift_link, strava_segment_id, category).run();
    
    return new Response(JSON.stringify({ success: true, id: result.meta.lastRowId }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestPatch({ request, env }) {
  // Il middleware garantisce che solo Admin/Moderator arrivino qui
  try {
    const { id, name, day_of_week, time, description, zwift_link, strava_segment_id, category, is_active } = await request.json();
    await env.ZRL_DB.prepare(
      "UPDATE inox_events SET name = ?, day_of_week = ?, time = ?, description = ?, zwift_link = ?, strava_segment_id = ?, category = ?, is_active = ? WHERE id = ?"
    ).bind(name, day_of_week, time, description, zwift_link, strava_segment_id, category, is_active ? 1 : 0, id).run();
    
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestDelete({ request, env }) {
  // Il middleware garantisce che solo Admin/Moderator arrivino qui
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id parameter" }), { status: 400 });
  }

  try {
    await env.ZRL_DB.prepare("DELETE FROM inox_events WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

