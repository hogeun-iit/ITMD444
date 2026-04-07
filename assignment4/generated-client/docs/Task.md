
# Task

A task resource stored in the system

## Properties

Name | Type
------------ | -------------
`id` | string
`title` | string
`assignee` | string
`status` | string
`priority` | string
`estimateHours` | number
`dueDate` | Date

## Example

```typescript
import type { Task } from ''

// TODO: Update the object below with actual values
const example = {
  "id": task-1,
  "title": Implement login API,
  "assignee": Alice Kim,
  "status": IN_PROGRESS,
  "priority": HIGH,
  "estimateHours": 6,
  "dueDate": 2026-04-10,
} satisfies Task

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Task
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


