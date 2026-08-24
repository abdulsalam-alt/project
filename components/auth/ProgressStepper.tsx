interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressStepper({
  currentStep,
  totalSteps,
}: ProgressStepperProps) {
  return (
    <div className="flex items-center gap-3">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const step = index + 1;

        return (
          <div
            key={step}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              step <= currentStep
                ? "bg-[#6b3807]"
                : "bg-[#E5E7EB]"
            }`}
          />
        );
      })}
    </div>
  );
}