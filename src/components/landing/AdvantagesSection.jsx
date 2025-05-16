
import React from "react";
import { Check } from "lucide-react";
import { advantages } from "@/data/featuresData";

const AdvantagesSection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Teams Choose AgileFlow</h2>
          <p className="text-muted-foreground">
            Built to supercharge your development workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advantages.map((item, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-6 border hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-3">
                  <Check className="h-4 w-4" />
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
              </div>
              <p className="text-muted-foreground pl-11">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;
