
# TaskStats

Aggregated statistics derived from the stored tasks

## Properties

Name | Type
------------ | -------------
`totalTasks` | number
`completedTasks` | number
`overdueTasks` | number
`averageEstimateHours` | number
`tasksByStatus` | [TaskStatsTasksByStatus](TaskStatsTasksByStatus.md)

## Example

```typescript
import type { TaskStats } from ''

// TODO: Update the object below with actual values
const example = {
  "totalTasks": 5,
  "completedTasks": 2,
  "overdueTasks": 1,
  "averageEstimateHours": 5.4,
  "tasksByStatus": null,
} satisfies TaskStats

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TaskStats
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


