export async function onRequestGET() {
  return new Response(JSON.stringify({ message: "API functions are working correctly!" }), {
    headers: { "Content-Type": "application/json" }
  });
}
