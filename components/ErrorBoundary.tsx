
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
    fallbackTitle?: string;
    fallbackMessage?: string;
    onReset?: () => void;
    resetLabel?: string;
    isolate?: boolean;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        if (this.props.onReset) {
            this.props.onReset();
        } else {
            window.location.reload();
        }
    };

    public render() {
        if (this.state.hasError) {
            const title = this.props.fallbackTitle || "Something went wrong.";
            const message = this.props.fallbackMessage || "A crash occurred in the application logic. Please show this to the developer.";
            const buttonText = this.props.resetLabel || (this.props.onReset ? "Return" : "Reload Application");

            if (this.props.isolate) {
                return (
                    <div className="p-8 flex flex-col items-center justify-center text-left max-w-2xl mx-auto my-8">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-rose-200 w-full">
                            <h2 className="text-xl font-black text-rose-600 mb-2">{title}</h2>
                            <p className="text-slate-600 mb-4 text-sm">{message}</p>
                            {this.state.error && (
                                <div className="bg-slate-900 text-rose-300 p-3 rounded-xl overflow-auto text-xs font-mono mb-4 max-h-[160px]">
                                    {this.state.error.toString()}
                                </div>
                            )}
                            <button
                                onClick={this.handleReset}
                                className="px-5 py-2.5 bg-rose-600 text-white font-bold text-sm rounded-xl hover:bg-rose-700 transition-colors"
                            >
                                {buttonText}
                            </button>
                        </div>
                    </div>
                );
            }

            return (
                <div className="min-h-screen bg-rose-50 p-8 flex flex-col items-center justify-center text-left">
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-rose-200 max-w-3xl w-full">
                        <h1 className="text-2xl font-black text-rose-600 mb-4">{title}</h1>
                        <p className="text-slate-600 mb-6">{message}</p>

                        <div className="bg-slate-900 text-slate-200 p-4 rounded-xl overflow-auto text-xs font-mono mb-6 max-h-[300px]">
                            <p className="text-rose-400 font-bold mb-2">{this.state.error && this.state.error.toString()}</p>
                            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                        </div>

                        <button
                            onClick={this.handleReset}
                            className="px-6 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors"
                        >
                            {buttonText}
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
