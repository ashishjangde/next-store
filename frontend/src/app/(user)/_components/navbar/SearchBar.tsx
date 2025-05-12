import { useEffect, useRef, useState } from "react"
import { Search, X, Mic } from 'lucide-react'
import { Input } from "@/components/ui/input"

export const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | KeyboardEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleClearSearch = () => {
    setSearchQuery("")
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }

  const handleSearchFocus = () => {
    if (searchQuery) {
      setShowSuggestions(true)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setSelectedIndex(-1)
    setShowSuggestions(!!e.target.value)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }

  const searchSuggestions = [
    "Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig", "Grape", "Honeydew"
  ].filter(suggestion =>
    searchQuery && suggestion.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex(prev => Math.min(prev + 1, searchSuggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      handleSuggestionClick(searchSuggestions[selectedIndex])
    }
  }

  return (
    <div ref={searchRef} className="flex items-center w-full md:w-[550px] max-w-[720px]">
      <div className="relative flex w-full">
        <div className="flex flex-1 items-center">
          <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onKeyDown={handleKeyDown}
              className={`w-full h-10 rounded-l-full rounded-r-none border-r-0 bg-white/10 dark:text-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-primary pl-10 pr-12`}
              placeholder="Search products..."
            />
            {searchQuery && (
              <X
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-300"
              />
            )}
          </div>
            <div className="flex items-center justify-center h-10 w-16 rounded-l-none rounded-r-full bg-gray-200 dark:bg-background/50 border-[0.1px] dark:border-gray-800 cursor-pointer">
            <Search className="h-5 w-5 text-gray-400" />
            </div>
        </div>

        {showSuggestions && searchSuggestions.length > 0 && (
          <div className="absolute w-[calc(100%-60px)] mt-11 bg-background border dark:border-gray-700 rounded-lg shadow-lg z-50">
            {searchSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 px-4 py-2.5 cursor-pointer dark:text-gray-300 hover:bg-white/5 ${selectedIndex === index ? 'bg-white/5' : ''}`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <Search className="w-4 h-4 mr- darK:text-gray-400" />
                <span className="flex-1">{suggestion}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
