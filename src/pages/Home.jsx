import { useState } from 'react'
import { useAppStore } from '../store'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Button from '../components/Button'
import { Heart, Star, Github } from 'lucide-react'

const Home = () => {
  const [count, setCount] = useState(0)
  const { theme, setTheme } = useAppStore()
  const [favorites, setFavorites] = useLocalStorage('favorites', [])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const addToFavorites = () => {
    const newFavorite = `Item ${Date.now()}`
    setFavorites([...favorites, newFavorite])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            React + Vite + Tailwind Setup
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Complete setup with React Router, TanStack Query, Zustand, React
            Hook Form, Zod, Recharts, and more!
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500" />
              Counter Demo
            </h2>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-4">
                {count}
              </div>
              <div className="space-x-2">
                <Button onClick={() => setCount(count + 1)}>Increment</Button>
                <Button variant="outline" onClick={() => setCount(count - 1)}>
                  Decrement
                </Button>
                <Button variant="destructive" onClick={() => setCount(0)}>
                  Reset
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500" />
              LocalStorage Demo
            </h2>
            <div className="space-y-4">
              <Button onClick={addToFavorites} className="w-full">
                Add to Favorites
              </Button>
              <div className="max-h-32 overflow-y-auto">
                {favorites.length > 0 ? (
                  <ul className="space-y-1">
                    {Array.isArray(favorites) &&
                      favorites.map((item, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-600 bg-gray-50 p-2 rounded"
                        >
                          {item}
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No favorites yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Zustand Store Demo</h2>
          <div className="flex items-center justify-between">
            <span className="text-lg">
              Current theme: <strong>{theme}</strong>
            </span>
            <Button onClick={toggleTheme} variant="outline">
              Toggle Theme
            </Button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Github className="h-6 w-6" />
            Installed Packages
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Routing & State</h3>
              <ul className="space-y-1 opacity-90">
                <li>• react-router-dom</li>
                <li>• @tanstack/react-query</li>
                <li>• zustand</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Forms & Validation</h3>
              <ul className="space-y-1 opacity-90">
                <li>• react-hook-form</li>
                <li>• zod</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">UI & Utils</h3>
              <ul className="space-y-1 opacity-90">
                <li>• recharts</li>
                <li>• clsx</li>
                <li>• lucide-react</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
