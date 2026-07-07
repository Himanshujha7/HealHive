import {
  Heart,
  Brain,
  Bone,
  Eye,
  Thermometer,
  Venus,
  Baby,
  Biohazard,
} from "lucide-react";

const specialties = [
  { name: "Cardiology", icon: Heart, desc: "Heart and vascular system care." },
  {
    name: "Neurology",
    icon: Brain,
    desc: "Brain and nervous system specialists.",
  },
  {
    name: "Orthopedics",
    icon: Bone,
    desc: "Bones, joints, and musculoskeletal care.",
  },
  {
    name: "Ophthalmology",
    icon: Eye,
    desc: "Eye exams, surgery, and vision care.",
  },
  {
    name: "General Medicine",
    icon: Thermometer,
    desc: "Routine check-ups & preventive care.",
  },
  {
    name: "Gynecology",
    icon: Venus,
    desc: "Women’s health and reproductive care.",
  },
  {
    name: "Pediatrics",
    icon: Baby,
    desc: "Medical care for infants and children.",
  },
  {
    name: "Infectious Diseases",
    icon: Biohazard,
    desc: "Management of infections & epidemics.",
  },
];

const Specialties = () => {
  return (
    <section
      id="specialties"
      className="relative bg-linear-to-br from-emerald-50 via-white to-teal-50 py-24 overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute -top-32 left-1/4 h-96 w-96 bg-emerald-200/40 rounded-full blur-3xl animate-pulse" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fadeUp">
          <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-sm font-semibold">
            Our Expertise
          </span>
          <h2 className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 leading-tight">
            Medical Specialties We Cover
          </h2>

          <p className="mt-5 text-lg md:text-xl leading-8 text-slate-700 max-w-2xl mx-auto">
            Connect with experienced specialists across a wide range of fields, from
            general medicine to advanced care.
          </p>
        </div>

        {/* Specialties Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {specialties.map((spec, idx) => {
            const Icon = spec.icon;
            return (
              <div
                key={idx}
                className="relative bg-white border border-emerald-100 rounded-2xl shadow-sm p-6 text-center transition-all hover:border-emerald-500 animate-fadeUp"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Icon with background shape */}
                <div className="relative mb-4">
                  <div className="absolute -inset-2 rounded-full bg-emerald-100 opacity-30 blur-xl"></div>
                  <div className="relative flex items-center justify-center h-16 w-16 rounded-full bg-linear-to-br from-emerald-500 to-teal-500 text-white transition-transform group hover:scale-110 mx-auto">
                    <Icon className="h-8 w-8 group-hover:animate-pulse" />
                  </div>
                </div>

                {/* Specialty Name */}
                <h3 className="text-lg font-semibold text-slate-900">
                  {spec.name}
                </h3>

                {/* Description */}
                <p className="mt-2 text-slate-600 text-sm">{spec.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Specialties;
