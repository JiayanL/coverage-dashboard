import { demoRecommendations } from "@/lib/demo/data"

export function getDemoFleetMetrics() {
  const approved = demoRecommendations.filter((item) => item.status === "approved")
  const rejected = demoRecommendations.filter((item) => item.status === "rejected")
  const openedPrs = approved.filter((item) => item.pr).length
  const coverageDelta = approved.reduce(
    (sum, item) => sum + item.deltaCoverage,
    0,
  )
  const mutationDelta = approved.reduce(
    (sum, item) => sum + item.deltaMutation,
    0,
  )

  return {
    recommendations: demoRecommendations.length,
    approved: approved.length,
    rejected: rejected.length,
    openedPrs,
    coverageDelta,
    mutationDelta,
  }
}
