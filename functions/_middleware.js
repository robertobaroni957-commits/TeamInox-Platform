// TEMPORARY BYPASS MIDDLEWARE
export async function onRequest(context) {
    const { next } = context;
    // Disabilita tutto per permettere la migrazione
    return next();
}
