import Link from "next/link"
import ImageCarousel from "@/components/ImageCarousel"

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Carousel */}
      <div className="container mx-auto px-4 py-8">
        <ImageCarousel />
      </div>

      {/* Hero Section with Bridge Story */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Kabulig Portal
            </h1>
            <p className="text-xl md:text-2xl mb-4 font-semibold text-green-100">
              Empowering Farmers • Connecting Communities • Sustaining Future
            </p>
            <div className="mt-8 space-y-4 text-lg md:text-xl text-green-50">
              <p>
                We are building a connection that transforms how fresh produce reaches your table.
              </p>
              <p>
                From the hardworking hands of local farmers to the hearts of families across the community,
                Kabulig Portal eliminates the middlemen and ensures fair prices for both producers and consumers.
              </p>
              <p>
                Every purchase supports sustainable agriculture, preserves local farming traditions,
                and brings you the freshest, highest-quality products directly from the source.
              </p>
              <p className="font-semibold text-yellow-200">
                Together, we're creating a sustainable future where farmers thrive and communities eat better.
              </p>
            </div>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors text-center"
              >
                Shop Products
              </Link>
              <Link
                href="/register"
                className="bg-green-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-900 transition-colors border-2 border-white text-center"
              >
                Join as Farmer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Our Three Pillars
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-green-600 text-4xl mb-4">🌾</div>
              <h3 className="text-xl font-bold mb-2">Empowering Farmers</h3>
              <p className="text-gray-600">
                Farm to Market - Direct connection between farmers and consumers. Fresh produce, fair prices, sustainable agriculture.
              </p>
              <span className="inline-block mt-4 text-green-600 font-semibold">Active Now</span>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-blue-600 text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-2">Connecting Communities</h3>
              <p className="text-gray-600">
                Education - Agricultural knowledge sharing, training programs, and resources for farmers and enthusiasts.
              </p>
              <span className="inline-block mt-4 text-gray-400 font-semibold">Coming Soon</span>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-purple-600 text-4xl mb-4">🏞️</div>
              <h3 className="text-xl font-bold mb-2">Sustaining Future</h3>
              <p className="text-gray-600">
                Tourism - Agri-tourism experiences, farm visits, and cultural immersion in agricultural communities.
              </p>
              <span className="inline-block mt-4 text-gray-400 font-semibold">Coming Soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-green-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Join the Movement?
          </h2>
          <p className="text-xl mb-8 text-green-100">
            Whether you're a farmer looking to reach more customers or a consumer seeking fresh, local produce,
            Kabulig Portal is your gateway to a better food system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors text-center"
            >
              Get Started
            </Link>
            <Link
              href="/products"
              className="bg-transparent text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors border-2 border-white text-center"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
