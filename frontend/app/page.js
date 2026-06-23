import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-8 py-16 text-white shadow-xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-wider text-indigo-100">
          Enterprise Learning Platform
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Learn, grow, and master new skills with Xebia LMS
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-indigo-100">
          A modern learning management system powered by Next.js, Spring Boot,
          Spring Cloud Gateway, and secure JWT authentication.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/courses"
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            Browse courses
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: 'Structured learning paths',
            text: 'Courses organized into categories, modules, submodules, and rich content.',
          },
          {
            title: 'Secure access',
            text: 'JWT auth with role-based permissions for admins, instructors, and students.',
          },
          {
            title: 'Cloud-native backend',
            text: 'Eureka service discovery, Config Server, API Gateway, and Resilience4j.',
          },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm text-zinc-600">{item.text}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
