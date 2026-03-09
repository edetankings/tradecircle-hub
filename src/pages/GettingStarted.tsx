import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, BookOpen, Cable, TrendingUp, Brain, Calendar } from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";

export default function GettingStarted() {
  const { startTour } = useOnboarding();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Getting Started</h1>
          <p className="text-muted-foreground mt-2">Learn how to make the most of your trading journal</p>
        </div>
        <Button onClick={startTour}>
          <Play className="mr-2 h-4 w-4" />
          Take the Tour
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cable className="h-5 w-5" />
              Connect Your Account
            </CardTitle>
            <CardDescription>Sync trades automatically from your broker</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Manual Account</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Create a manual account to track trades you enter yourself.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="/connect">Set Up Manual Account</a>
              </Button>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                MT4/MT5 Integration
                <Badge variant="secondary">Coming Soon</Badge>
              </h4>
              <p className="text-sm text-muted-foreground">
                Automatically sync trades from MetaTrader platforms.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                Myfxbook Integration
                <Badge variant="secondary">Coming Soon</Badge>
              </h4>
              <p className="text-sm text-muted-foreground">
                Import historical trades from Myfxbook.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Quick Start Guide
            </CardTitle>
            <CardDescription>Get up and running in minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 list-decimal list-inside">
              <li className="text-sm">Create or connect a trading account</li>
              <li className="text-sm">Set up your trading plan with rules and limits</li>
              <li className="text-sm">Add your first trade manually or via sync</li>
              <li className="text-sm">Write reflections after each trading session</li>
              <li className="text-sm">Review your analytics to improve performance</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Track Your Performance
            </CardTitle>
            <CardDescription>Monitor and improve your trading</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• View detailed analytics on your dashboard</p>
            <p>• Track win rate, profit factor, and more</p>
            <p>• Filter trades by pair, strategy, and date</p>
            <p>• Compare performance across accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Journal Your Journey
            </CardTitle>
            <CardDescription>Build mental discipline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Write daily reflections on your trading</p>
            <p>• Track emotions before and after trades</p>
            <p>• Document lessons learned and mistakes</p>
            <p>• Review past reflections for insights</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Video Tutorials
              <Badge variant="secondary">Coming Soon</Badge>
            </CardTitle>
            <CardDescription>Learn with step-by-step video guides</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Account Setup</p>
            </div>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Trading Plan</p>
            </div>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Analytics Guide</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
