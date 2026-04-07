
# TaskUpdate

Input payload used to partially update an existing task

## Properties

Name | Type
------------ | -------------
`title` | string
`assignee` | string
`status` | string
`priority` | string
`estimateHours` | number
`dueDate` | Date

## Example

```typescript
import type { TaskUpdate } from ''

// TODO: Update the object below with actual values
const example = {
  "title": Update API documentation,
  "assignee": Charlie Park,
  "status": DONE,
  "priority": LOW,
  "estimateHours": 8,
  "dueDate": 2026-04-20,
} satisfies TaskUpdate

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TaskUpdate
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


