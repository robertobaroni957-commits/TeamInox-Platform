// ... (codice precedente) ...
      } catch (e: any) {
        console.error("[DEBUG] API GET Availability Error:", e);
        // Gestione più robusta dell'errore per evitare problemi di sintassi durante la build
        let errorMessage = 'Errore durante l'inizializzazione.'; // Fallback message
        if (e.message) {
            // Tenta di ottenere un messaggio leggibile dall'errore
            if (typeof e.message === 'string') {
                errorMessage = e.message;
            } else if (typeof e.message === 'object' && e.message !== null) {
                errorMessage = JSON.stringify(e.message); // Serializza se è un oggetto
            } else {
                errorMessage = 'Errore generico durante l'elaborazione.';
            }
        }
        // Assicura che il messaggio sia una stringa e gestisce il caso in cui data.error sia null/undefined
        setMessage({ type: 'error', text: `Error: ${errorMessage || 'Errore durante l'inizializzazione.'}` });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ... (resto del codice del componente) ...
