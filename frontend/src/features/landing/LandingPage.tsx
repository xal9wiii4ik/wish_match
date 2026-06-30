import { motion } from "framer-motion";
import { ArrowRight, Compass, Heart, MapPinned, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { app_routes } from "@/config/routes";
import { Button } from "@/components/ui";
import { Logo } from "@/components/layout/Logo";

const features = [
  {
    icon: Compass,
    title: "Лента желаний",
    text: "Свайпайте желания других людей и находите тех, с кем по пути.",
  },
  {
    icon: MapPinned,
    title: "Карта рядом",
    text: "Интерактивная карта показывает желания вокруг вас по координатам.",
  },
  {
    icon: Heart,
    title: "Совпадения",
    text: "Взаимный интерес превращается в матч и контакт для общения.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-surface">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex items-center gap-3">
          <Link to={app_routes.login}>
            <Button variant="ghost" size="sm">
              Войти
            </Button>
          </Link>
          <Link to={app_routes.register}>
            <Button size="sm">Начать</Button>
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-600/30 blur-3xl" />

        <section className="relative z-10 flex flex-col items-center pb-20 pt-16 text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300"
          >
            <Sparkles className="h-4 w-4 text-brand-300" />
            Находи людей по общим желаниям
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-6xl"
          >
            Превращай желания в{" "}
            <span className="gradient-text">совместные истории</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 max-w-xl text-lg text-slate-400"
          >
            WishMatch соединяет людей, которые хотят одного и того же — рядом с
            вами. Создавайте желания, свайпайте и находите компанию.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link to={app_routes.register}>
              <Button size="lg" right_icon={<ArrowRight className="h-4 w-4" />}>
                Создать аккаунт
              </Button>
            </Link>
            <Link to={app_routes.login}>
              <Button size="lg" variant="secondary">
                У меня есть аккаунт
              </Button>
            </Link>
          </motion.div>
        </section>

        <section className="relative z-10 grid gap-6 pb-24 sm:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="glass-panel rounded-2xl p-6"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
                <feature.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400">{feature.text}</p>
            </motion.div>
          ))}
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} WishMatch
      </footer>
    </div>
  );
}
