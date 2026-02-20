"use client"

import { IngredientNode } from "./ingredient-node"

const INGREDIENTS = [
  { id: "kale", color: "#1A4B22", initialPosition: [-2.5, 1, 0] as const, geometry: "icosahedron" as const },
  { id: "beet", color: "#7A003C", initialPosition: [-1, 1.5, 1] as const, geometry: "sphere" as const },
  { id: "ginger", color: "#F2C84B", initialPosition: [1, 1.5, 1] as const, geometry: "dodecahedron" as const },
  { id: "charcoal", color: "#111111", initialPosition: [2.5, 1, 0] as const, geometry: "tetrahedron" as const },
]

export function NodePantry() {
  return (
    <group>
      {INGREDIENTS.map((item) => (
        <IngredientNode
          key={item.id}
          id={item.id}
          color={item.color}
          initialPosition={[...item.initialPosition]}
          geometry={item.geometry}
        />
      ))}
    </group>
  )
}
