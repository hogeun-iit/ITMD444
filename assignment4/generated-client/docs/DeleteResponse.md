
# DeleteResponse

Response returned after a successful delete operation

## Properties

Name | Type
------------ | -------------
`message` | string

## Example

```typescript
import type { DeleteResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "message": Task deleted successfully,
} satisfies DeleteResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DeleteResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


