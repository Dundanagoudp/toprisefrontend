import React from "react";
import { LucideIcon } from "lucide-react";

export interface Step {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface StepProgressBarProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
  className?: string;
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  steps,
  currentStep,
  completedSteps = [],
  className = "",
}) => {
  const isStepCompleted = (stepIndex: number) => {
    return completedSteps.includes(stepIndex) || stepIndex < currentStep;
  };

  const isStepActive = (stepIndex: number) => {
    return stepIndex === currentStep;
  };

  const getStepStatus = (stepIndex: number) => {
    if (isStepCompleted(stepIndex) || isStepActive(stepIndex)) {
      return {
        circleClass: "bg-red-600",
        iconClass: "text-white",
        labelClass: "text-red-600",
        connectorClass: "bg-red-600",
      };
    }
    return {
      circleClass: "bg-gray-300",
      iconClass: "text-gray-500",
      labelClass: "text-gray-500",
      connectorClass: "bg-gray-300",
    };
  };

  return (
    <div className={`bg-white border-b ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Desktop: Horizontal layout */}
        <div className="hidden sm:flex items-center justify-center space-x-4 lg:space-x-8">
          {steps.map((step, index) => {
            const { circleClass, iconClass, labelClass, connectorClass } =
              getStepStatus(index);
            const IconComponent = step.icon;

            return (
              <React.Fragment key={step.id}>
                {/* Step */}
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <div className={`w-8 h-8 lg:w-10 lg:h-10 ${circleClass} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className={`w-4 h-4 lg:w-5 lg:h-5 ${iconClass}`} />
                  </div>
                  <div className={`mt-2 text-xs lg:text-sm font-medium ${labelClass} text-center leading-tight`}>
                    {step.label}
                  </div>
                </div>

                {/* Connector - Only show if not the last step */}
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 ${connectorClass} max-w-12 lg:max-w-20`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile: Vertical layout */}
        <div className="sm:hidden space-y-4">
          {steps.map((step, index) => {
            const { circleClass, iconClass, labelClass } = getStepStatus(index);
            const IconComponent = step.icon;

            return (
              <div key={step.id} className="flex items-center space-x-4">
                <div className={`w-8 h-8 ${circleClass} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className={`w-4 h-4 ${iconClass}`} />
                </div>
                <div className={`text-sm font-medium ${labelClass} flex-1`}>
                  {step.label}
                </div>
                {(isStepCompleted(index) || isStepActive(index)) && (
                  <div className="text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepProgressBar; 