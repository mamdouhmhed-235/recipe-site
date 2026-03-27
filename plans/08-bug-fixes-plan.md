# Bug Fixes Plan

## Issues Identified

### 1. Recipe Page Redirects to Homepage

**Symptom**: When clicking on a category and choosing a recipe, the recipe page loads briefly then redirects to homepage.

**Root Cause**: The service worker's `controllerchange` event listener in [`sw-register.ts`](../client/src/sw-register.ts:48-51) triggers a full page reload when the service worker controller changes. This can happen during navigation and causes the app to reload to the homepage.

**File**: `client/src/sw-register.ts`

**Current Code**:
```typescript
navigator.serviceWorker.addEventListener('controllerchange', () => {
  // Reload page to use new service worker
  window.location.reload();
});
```

**Fix**: Only reload if the user confirms they want to update, or remove automatic reload during navigation. The reload should only happen when the user explicitly accepts an update.

---

### 2. Homepage Shows No Recipes by Default

**Symptom**: Homepage displays "Select a category or search for recipes" instead of showing recipes.

**Root Cause**: In [`Home.tsx`](../client/src/pages/Home.tsx:44-49), the meals array is empty when no search query or category is selected.

**File**: `client/src/pages/Home.tsx`

**Current Code**:
```typescript
const meals = searchQuery 
  ? (searchData?.meals || [])
  : selectedCategory 
    ? (categoryData?.meals || [])
    : [] // <-- Empty when nothing selected
```

**Fix**: Fetch and display random meals on initial load to populate the homepage with content.

---

### 3. Random Recipe Button Does Not Navigate

**Symptom**: Clicking "Random Recipe" button fetches data but doesn't navigate to the recipe.

**Root Cause**: In [`Home.tsx`](../client/src/pages/Home.tsx:63-70), the button only calls `refetchRandom()` without handling the result.

**File**: `client/src/pages/Home.tsx`

**Current Code**:
```typescript
<Button 
  onClick={() => refetchRandom()}
  variant="outline"
  size="lg"
>
  <Sparkles className="mr-2 h-4 w-4" />
  Random Recipe
</Button>
```

**Fix**: Navigate to the random recipe details page after fetching.

---

## Implementation Steps

### Step 1: Fix Service Worker Controller Change
- Modify `client/src/sw-register.ts` to remove automatic reload on controllerchange
- Only reload when user explicitly accepts an update via the UpdatePrompt component

### Step 2: Show Random Meals on Homepage
- Add a query to fetch multiple random meals on homepage load
- Display these meals when no search or category is selected
- TheMealDB API only provides single random meals, so fetch multiple times

### Step 3: Fix Random Recipe Button Navigation
- Use `useNavigate` from react-router-dom
- Navigate to the meal details page after successful random meal fetch

---

## Files to Modify

1. `client/src/sw-register.ts` - Remove automatic reload
2. `client/src/pages/Home.tsx` - Show random meals by default, fix random button navigation
3. `client/src/lib/api.ts` - Add function to fetch multiple random meals (optional)

---

## Testing Checklist

- [ ] Navigate to category, click recipe, verify it stays on details page
- [ ] Load homepage, verify recipes are displayed
- [ ] Click Random Recipe button, verify navigation to details page
- [ ] Test category filtering still works
- [ ] Test search functionality still works
- [ ] Test favorites functionality
