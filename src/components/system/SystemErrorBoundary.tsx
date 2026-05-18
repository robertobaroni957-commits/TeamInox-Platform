import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class SystemErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("System Error Boundary caught:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                    <h2>Sistema non disponibile</h2>
                    <p>Si è verificato un errore critico nel modulo.</p>
                    <button onClick={() => window.location.reload()} className="mt-2 text-red-600 underline">
                        Ricarica applicazione
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
