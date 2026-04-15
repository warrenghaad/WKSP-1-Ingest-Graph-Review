import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Reader from "@/pages/Reader";
import Lab from "@/pages/Lab";
import Braid from "@/pages/Braid";
import Textreader from "@/pages/Textreader";
import Timeline from "@/pages/Timeline";
import GEACalculator from "@/pages/GEACalculator";
import BraidNode from "@/pages/BraidNode";
import OntologyExplorer from "@/pages/OntologyExplorer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/reader" component={Reader}/>
      <Route path="/lab" component={Lab}/>
      <Route path="/braid" component={Braid}/>
      <Route path="/textreader" component={Textreader}/>
      <Route path="/timeline" component={Timeline}/>
      <Route path="/gea" component={GEACalculator}/>
      <Route path="/ontology" component={OntologyExplorer}/>
      <Route path="/node/:id" component={BraidNode}/>
      <Route component={NotFound} />
    </Switch>
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
