import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getCategories } from '@/lib/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'

export function Categories() {
  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  })

  const categories = categoriesData?.categories || []

  if (error) {
    return (
      <EmptyState
        icon="⚠️"
        title="Failed to load categories"
        description="Please try again later"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Recipe Categories</h1>
        <p className="text-muted-foreground mt-2">
          Browse recipes by category
        </p>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          role="list"
          aria-label="Recipe categories"
        >
          {categories.map((category) => (
            <Link
              key={category.idCategory}
              to={`/?category=${encodeURIComponent(category.strCategory)}`}
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
              role="listitem"
            >
              <Card className="overflow-hidden transition-all hover:shadow-lg h-full">
                {/* Category Image */}
                <div className="aspect-video overflow-hidden">
                  <img
                    src={category.strCategoryThumb}
                    alt={category.strCategory}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>

                <CardHeader className="pb-2">
                  <h3 className="font-semibold text-lg">
                    {category.strCategory}
                  </h3>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {category.strCategoryDescription}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📂"
          title="No categories found"
          description="Categories are not available at the moment"
        />
      )}
    </div>
  )
}

export default Categories
