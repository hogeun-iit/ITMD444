
# TaskCreate

Input payload used to create a new task

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
import type { TaskCreate } from ''

// TODO: Update the object below with actual values
const example = {
  "title": Write unit tests,
  "assignee": Bob Lee,
  "status": TODO,
  "priority": MEDIUM,
  "estimateHours": 4,
  "dueDate": 2026-04-15,
} satisfies TaskCreate

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TaskCreate
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


