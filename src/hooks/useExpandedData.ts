import { useState } from 'react'

interface ExpandedCarData {
  id: string
  // добавьте другие поля в зависимости от ответа API
}

export const useExpandedData = () => {
  const [expandedData, setExpandedData] = useState<Record<string, ExpandedCarData>>({})
  const [loadingExpanded, setLoadingExpanded] = useState<Set<string>>(new Set())

  const fetchExpandedData = async (carId: string) => {
    if (expandedData[carId]) {
      return expandedData[carId]
    }

    setLoadingExpanded(prev => new Set([...prev, carId]))

    try {
      const response = await fetch(`http://192.168.0.11:8081/api/cars/CarCatalogs/${carId}`)
      const data = await response.json()

      setExpandedData(prev => ({
        ...prev,
        [carId]: data
      }))

      return data
    } catch (error) {
      console.error('Error fetching expanded data:', error)
      throw error
    } finally {
      setLoadingExpanded(prev => {
        const newSet = new Set(prev)
        newSet.delete(carId)
        return newSet
      })
    }
  }

  const isExpandedLoading = (carId: string) => loadingExpanded.has(carId)
  const getExpandedData = (carId: string) => expandedData[carId]

  return {
    fetchExpandedData,
    isExpandedLoading,
    getExpandedData
  }
} 