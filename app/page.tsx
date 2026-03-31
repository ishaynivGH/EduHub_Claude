export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-pastel-blue mb-4">
          Welcome to LSIeduHub
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A comprehensive learning platform for all ages
        </p>
        <div className="space-y-4">
          <button className="bg-pastel-green hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-lg transition-all">
            Sign Up
          </button>
          <button className="bg-pastel-blue hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-lg transition-all ml-4">
            Login
          </button>
        </div>
      </div>
    </main>
  )
}
