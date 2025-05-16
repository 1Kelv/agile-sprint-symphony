
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, PlusCircle, Calendar, Users, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import FlowingText from "@/components/animations/FlowingText";
import { motion } from "framer-motion";
import { features } from "@/data/featuresData";

const HeroSection = ({ user }) => {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Function to get the icon component based on name
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case "PlusCircle": return <PlusCircle className="h-5 w-5" />;
      case "Calendar": return <Calendar className="h-5 w-5" />;
      case "Users": return <Users className="h-5 w-5" />;
      case "LineChart": return <LineChart className="h-5 w-5" />;
      default: return null;
    }
  };

  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 relative z-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <span className="bg-agile-primary/10 text-agile-primary px-4 py-1.5 rounded-full text-sm font-medium inline-flex items-center">
              <Sparkles className="mr-1.5 h-4 w-4" />
              Agile Project Management
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <FlowingText text="Ship Better Software, Faster" />
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plan, track, and deliver great software with AgileFlow's intuitive tools.
          </p>

          {/* Hero illustration */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="aspect-[16/9] bg-gradient-to-br from-agile-primary/20 to-agile-secondary/20 rounded-xl flex items-center justify-center border overflow-hidden">
              <div className="relative w-full h-full p-6">
                {/* Mock UI graphics */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-card rounded-lg border shadow-lg flex flex-col">
                  <div className="h-10 bg-muted/50 border-b flex items-center px-4">
                    <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <div className="mx-auto text-xs font-mono text-muted-foreground">AgileFlow Dashboard</div>
                  </div>
                  <div className="flex-1 p-3 flex">
                    <div className="w-1/4 border-r">
                      <div className="h-6 bg-muted/30 rounded mb-2 w-5/6"></div>
                      <div className="h-4 bg-muted/30 rounded mb-1 w-4/6"></div>
                      <div className="h-4 bg-muted/30 rounded mb-1 w-5/6"></div>
                      <div className="h-4 bg-muted/30 rounded mb-1 w-3/6"></div>
                    </div>
                    <div className="w-3/4 p-3">
                      <div className="h-8 bg-muted/30 rounded mb-4 w-1/3"></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-20 bg-muted/20 rounded"></div>
                        <div className="h-20 bg-muted/20 rounded"></div>
                        <div className="h-20 bg-muted/20 rounded"></div>
                        <div className="h-20 bg-muted/20 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Button size="lg" asChild>
                <Link to="/dashboard">
                  Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link to="/auth?mode=signup">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/auth?mode=login">Log In</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              className="relative rounded-xl p-6 border hover:shadow-md transition-all duration-300"
              variants={item}
            >
              <div
                className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}
              >
                {getIconComponent(feature.icon)}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
