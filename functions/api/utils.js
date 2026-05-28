export const jsonResponse = (data, status = 200, success = true, error = null) => {
    return new Response(JSON.stringify({ success, data, error }), {
        status,
        headers: { "Content-Type": "application/json" }
    });
};
