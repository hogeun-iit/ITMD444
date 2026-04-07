
# TaskStatsTasksByStatus

Count of tasks grouped by status

## Properties

Name | Type
------------ | -------------
`tODO` | number
`iNPROGRESS` | number
`dONE` | number

## Example

```typescript
import type { TaskStatsTasksByStatus } from ''

// TODO: Update the object below with actual values
const example = {
  "tODO": 1,
  "iNPROGRESS": 2,
  "dONE": 2,
} satisfies TaskStatsTasksByStatus

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TaskStatsTasksByStatus
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


