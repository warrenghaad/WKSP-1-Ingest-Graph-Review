import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

const Home = lazy(() => import("@/pages/Home"));
const Reader = lazy(() => import("@/pages/Reader"));
const Lab = lazy(() => import("@/pages/Lab"));
const Braid = lazy(() => import("@/pages/Braid"));
const Textreader = lazy(() => import("@/pages/Textreader"));
const Timeline = lazy(() => import("@/pages/Timeline"));
const GEACalculator = lazy(() => import("@/pages/GEACalculator"));
const BraidNode = lazy(() => import("@/pages/BraidNode"));
const OntologyExplorer = lazy(() => import("@/pages/OntologyExplorer"));
const Builder = lazy(() => import("@/pages/Builder"));

function PageFallback() {
  return (
    <div className="min-h-screen bg-[#060912] flex items-center justify-center">
      <div className="text-white/30 text-sm font-mono tracking-widest animate-pulse">CHRONOS</div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Switch>
        <Route path="/" component={Home}/>
        <Route path="/reader" component={Reader}/>
        <Route path="/lab" component={Lab}/>
        <Route path="/braid" component={Braid}/>
        <Route path="/textreader" component={Textreader}/>
        <Route path="/timeline" component={Timeline}/>
        <Route path="/gea" component={GEACalculator}/>
        <Route path="/ontology" component={OntologyExplorer}/>
        <Route path="/builder" component={Builder}/>
        <Route path="/node/:id" component={BraidNode}/>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
