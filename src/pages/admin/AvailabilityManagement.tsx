      } catch (e: any) {
        console.error("[DEBUG] API GET Availability Error:", e);
        // Gestione semplificata per evitare problemi di sintassi durante la build
        // Mostra un messaggio generico di errore anziché tentare di formattare e.message
        setError('Errore durante il recupero dei dati. Riprova più tardi.'); 
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
