// Correspondence Worker for heavy filtering, sorting, and processing
// Handles large datasets without blocking the main thread

// Import Fuse.js (assuming it's available globally or bundled)
// Note: In practice, you might need to import via importScripts or bundle separately

// Utility functions for filtering and sorting
function filterCorrespondences(correspondences, filters) {
  return correspondences.filter(correspondence => {
    // Category filter
    if (filters.category && correspondence.category !== filters.category) {
      return false
    }
    
    // Element filter
    if (filters.element && correspondence.element !== filters.element) {
      return false
    }
    
    // Energy type filter
    if (filters.energy && correspondence.energy_type !== filters.energy) {
      return false
    }
    
    // Planet filter
    if (filters.planet && correspondence.planet !== filters.planet) {
      return false
    }
    
    // Magical properties filter
    if (filters.properties && filters.properties.length > 0) {
      const hasProperty = filters.properties.some(prop => 
        correspondence.magical_properties && correspondence.magical_properties.includes(prop)
      )
      if (!hasProperty) return false
    }
    
    // Personal filter
    if (filters.personalOnly && !correspondence.is_personal) {
      return false
    }
    
    // Favorites filter
    if (filters.favoritesOnly && !correspondence.is_favorited) {
      return false
    }
    
    // Verified filter
    if (filters.verifiedOnly && !correspondence.verified) {
      return false
    }
    
    // Text search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      const searchableText = [
        correspondence.name,
        correspondence.description,
        correspondence.botanical_name,
        correspondence.personal_notes,
        correspondence.folklore,
        ...(correspondence.common_names || []),
        ...(correspondence.magical_properties || []),
        ...(correspondence.traditional_uses || []),
        ...(correspondence.medical_uses || []),
        ...(correspondence.deities || [])
      ].filter(Boolean).join(' ').toLowerCase()
      
      if (!searchableText.includes(searchLower)) {
        return false
      }
    }
    
    return true
  })
}

function sortCorrespondences(correspondences, sortBy, order = 'asc') {
  return [...correspondences].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'category':
        comparison = a.category.localeCompare(b.category)
        break
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
      case 'updated_at':
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        break
      case 'verified':
        // Verified entries first
        if (a.verified && !b.verified) comparison = -1
        else if (!a.verified && b.verified) comparison = 1
        else comparison = a.name.localeCompare(b.name)
        break
      case 'popularity':
        // Could be based on usage stats, for now use alphabetical
        comparison = a.name.localeCompare(b.name)
        break
      case 'relevance':
        // Used with search results, preserve original order
        comparison = 0
        break
      default:
        comparison = a.name.localeCompare(b.name)
    }
    
    return order === 'desc' ? -comparison : comparison
  })
}

function paginateResults(correspondences, page, pageSize) {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  
  return {
    items: correspondences.slice(start, end),
    pagination: {
      currentPage: page,
      pageSize: pageSize,
      totalItems: correspondences.length,
      totalPages: Math.ceil(correspondences.length / pageSize),
      hasNextPage: end < correspondences.length,
      hasPreviousPage: page > 1
    }
  }
}

function calculateStatistics(correspondences) {
  const stats = {
    total: correspondences.length,
    personal: 0,
    favorited: 0,
    verified: 0,
    byCategory: {},
    byElement: {},
    topProperties: {},
    byEnergyType: { masculine: 0, feminine: 0, unknown: 0 }
  }
  
  correspondences.forEach(c => {
    // Basic counts
    if (c.is_personal) stats.personal++
    if (c.is_favorited) stats.favorited++
    if (c.verified) stats.verified++
    
    // Category distribution
    stats.byCategory[c.category] = (stats.byCategory[c.category] || 0) + 1
    
    // Element distribution
    if (c.element) {
      stats.byElement[c.element] = (stats.byElement[c.element] || 0) + 1
    }
    
    // Energy type distribution
    if (c.energy_type === 'masculine') stats.byEnergyType.masculine++
    else if (c.energy_type === 'feminine') stats.byEnergyType.feminine++
    else stats.byEnergyType.unknown++
    
    // Magical properties frequency
    if (c.magical_properties) {
      c.magical_properties.forEach(prop => {
        stats.topProperties[prop] = (stats.topProperties[prop] || 0) + 1
      })
    }
  })
  
  // Convert properties to sorted array
  stats.topPropertiesList = Object.entries(stats.topProperties)
    .map(([property, count]) => ({ property, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20) // Top 20
  
  return stats
}

function groupCorrespondences(correspondences, groupBy) {
  const groups = {}
  
  correspondences.forEach(correspondence => {
    let groupKey
    
    switch (groupBy) {
      case 'category':
        groupKey = correspondence.category
        break
      case 'element':
        groupKey = correspondence.element || 'Unknown'
        break
      case 'energy':
        groupKey = correspondence.energy_type || 'Unknown'
        break
      case 'planet':
        groupKey = correspondence.planet || 'Unknown'
        break
      case 'firstLetter':
        groupKey = correspondence.name.charAt(0).toUpperCase()
        break
      case 'verified':
        groupKey = correspondence.verified ? 'Verified' : 'Unverified'
        break
      case 'personal':
        groupKey = correspondence.is_personal ? 'Personal' : 'Community'
        break
      default:
        groupKey = 'All'
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(correspondence)
  })
  
  // Sort each group
  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => a.name.localeCompare(b.name))
  })
  
  return groups
}

function findDuplicates(correspondences) {
  const duplicates = []
  const seen = new Map()
  
  correspondences.forEach((correspondence, index) => {
    const key = correspondence.name.toLowerCase().trim()
    
    if (seen.has(key)) {
      duplicates.push({
        original: seen.get(key),
        duplicate: { ...correspondence, index },
        similarity: calculateSimilarity(seen.get(key).item, correspondence)
      })
    } else {
      seen.set(key, { item: correspondence, index })
    }
  })
  
  return duplicates
}

function calculateSimilarity(a, b) {
  let score = 0
  let factors = 0
  
  // Name similarity
  if (a.name.toLowerCase() === b.name.toLowerCase()) {
    score += 30
  }
  factors++
  
  // Category match
  if (a.category === b.category) {
    score += 20
  }
  factors++
  
  // Botanical name similarity
  if (a.botanical_name && b.botanical_name && 
      a.botanical_name.toLowerCase() === b.botanical_name.toLowerCase()) {
    score += 25
  }
  factors++
  
  // Common properties overlap
  if (a.magical_properties && b.magical_properties) {
    const aProps = new Set(a.magical_properties)
    const bProps = new Set(b.magical_properties)
    const intersection = new Set([...aProps].filter(x => bProps.has(x)))
    const union = new Set([...aProps, ...bProps])
    
    if (union.size > 0) {
      score += (intersection.size / union.size) * 25
    }
  }
  factors++
  
  return Math.round(score / factors)
}

// Worker message handler
self.onmessage = function(e) {
  const { type, data, requestId } = e.data
  
  try {
    let result
    
    switch (type) {
      case 'FILTER_CORRESPONDENCES':
        result = filterCorrespondences(data.correspondences, data.filters)
        break
        
      case 'SORT_CORRESPONDENCES':
        result = sortCorrespondences(data.correspondences, data.sortBy, data.order)
        break
        
      case 'FILTER_AND_SORT':
        let filtered = filterCorrespondences(data.correspondences, data.filters)
        result = sortCorrespondences(filtered, data.sortBy, data.order)
        break
        
      case 'PAGINATE_CORRESPONDENCES':
        result = paginateResults(data.correspondences, data.page, data.pageSize)
        break
        
      case 'FULL_PROCESS':
        // Complete processing pipeline
        let processed = filterCorrespondences(data.correspondences, data.filters)
        processed = sortCorrespondences(processed, data.sortBy, data.order)
        result = paginateResults(processed, data.page, data.pageSize)
        break
        
      case 'CALCULATE_STATISTICS':
        result = calculateStatistics(data.correspondences)
        break
        
      case 'GROUP_CORRESPONDENCES':
        result = groupCorrespondences(data.correspondences, data.groupBy)
        break
        
      case 'FIND_DUPLICATES':
        result = findDuplicates(data.correspondences)
        break
        
      case 'BULK_EXPORT':
        // Prepare data for export
        const exportData = data.correspondences.map(c => ({
          name: c.name,
          category: c.category,
          description: c.description || '',
          magical_properties: (c.magical_properties || []).join('; '),
          traditional_uses: (c.traditional_uses || []).join('; '),
          element: c.element || '',
          planet: c.planet || '',
          energy_type: c.energy_type || '',
          is_personal: c.is_personal,
          is_favorited: c.is_favorited,
          verified: c.verified
        }))
        
        result = {
          data: exportData,
          count: exportData.length,
          timestamp: new Date().toISOString()
        }
        break
        
      default:
        throw new Error(`Unknown operation: ${type}`)
    }
    
    self.postMessage({
      type: 'SUCCESS',
      requestId,
      result,
      operation: type
    })
    
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      requestId,
      error: error.message,
      operation: type
    })
  }
}