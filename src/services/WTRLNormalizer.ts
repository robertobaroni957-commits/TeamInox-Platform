export const WTRLNormalizer = {
  normalizeTeam: (team: any) => ({
    externalId: team.id,
    name: team.name?.trim() || 'Unknown Team',
    division: team.division?.trim() || 'A',
    league: team.league?.trim() || 'Standard',
    zrldivision: team.zrldivision?.trim() || 'A',
    membersCount: team.membersCount || 0,
    rounds: team.rounds ? team.rounds.split(',') : [],
    isDev: false
  }),
  normalizeRider: (rider: any) => ({
    name: rider.name?.trim() || 'Unknown',
    wtrlId: rider.wtrlId?.toString(),
    category: rider.category?.toUpperCase().trim() || 'A'
  })
};
