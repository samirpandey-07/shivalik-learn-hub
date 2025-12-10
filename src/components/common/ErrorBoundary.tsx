import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    componentName?: string;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`Uncaught error in ${this.props.componentName || 'component'}:`, error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                        <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-red-900 dark:text-red-200">
                                Failed to load {this.props.componentName || "content"}
                            </h3>
                            <p className="text-xs text-red-600 dark:text-red-400 max-w-[200px] mx-auto">
                                {this.state.error?.message || "An unexpected error occurred"}
                            </p>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 hover:bg-red-100 text-red-700"
                            onClick={() => this.setState({ hasError: false })}
                        >
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}
