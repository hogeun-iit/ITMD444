# TasksApi

All URIs are relative to *https://itmd444-assignment4-task.onrender.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**taskServiceCreate**](TasksApi.md#taskservicecreate) | **POST** / | Create a new task |
| [**taskServiceDelete**](TasksApi.md#taskservicedelete) | **DELETE** /{id} | Delete a task |
| [**taskServiceGet**](TasksApi.md#taskserviceget) | **GET** /{id} | Get a task by ID |
| [**taskServiceList**](TasksApi.md#taskservicelist) | **GET** / | List all tasks |
| [**taskServiceUpdate**](TasksApi.md#taskserviceupdate) | **PATCH** /{id} | Partially update a task |



## taskServiceCreate

> Task taskServiceCreate(taskCreate)

Create a new task

Creates a new task with the provided task data.

### Example

```ts
import {
  Configuration,
  TasksApi,
} from '';
import type { TaskServiceCreateRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new TasksApi();

  const body = {
    // TaskCreate | Task creation payload
    taskCreate: ...,
  } satisfies TaskServiceCreateRequest;

  try {
    const data = await api.taskServiceCreate(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **taskCreate** | [TaskCreate](TaskCreate.md) | Task creation payload | |

### Return type

[**Task**](Task.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Task successfully created |  -  |
| **400** | Invalid request body or validation failure |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## taskServiceDelete

> DeleteResponse taskServiceDelete(id)

Delete a task

Deletes a task identified by its unique ID.

### Example

```ts
import {
  Configuration,
  TasksApi,
} from '';
import type { TaskServiceDeleteRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new TasksApi();

  const body = {
    // string | Unique identifier of the task
    id: task-1,
  } satisfies TaskServiceDeleteRequest;

  try {
    const data = await api.taskServiceDelete(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` | Unique identifier of the task | [Defaults to `undefined`] |

### Return type

[**DeleteResponse**](DeleteResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Task successfully deleted |  -  |
| **400** | Invalid path parameter |  -  |
| **404** | Task not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## taskServiceGet

> Task taskServiceGet(id)

Get a task by ID

Returns a single task resource identified by its unique ID.

### Example

```ts
import {
  Configuration,
  TasksApi,
} from '';
import type { TaskServiceGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new TasksApi();

  const body = {
    // string | Unique identifier of the task
    id: task-1,
  } satisfies TaskServiceGetRequest;

  try {
    const data = await api.taskServiceGet(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` | Unique identifier of the task | [Defaults to `undefined`] |

### Return type

[**Task**](Task.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successfully retrieved the task |  -  |
| **400** | Invalid path parameter |  -  |
| **404** | Task not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## taskServiceList

> Array&lt;Task&gt; taskServiceList()

List all tasks

Returns all tasks currently stored in the system.

### Example

```ts
import {
  Configuration,
  TasksApi,
} from '';
import type { TaskServiceListRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new TasksApi();

  try {
    const data = await api.taskServiceList();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;Task&gt;**](Task.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successfully retrieved all tasks |  -  |
| **400** | Bad request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## taskServiceUpdate

> Task taskServiceUpdate(id, taskUpdate)

Partially update a task

Updates one or more fields of an existing task.

### Example

```ts
import {
  Configuration,
  TasksApi,
} from '';
import type { TaskServiceUpdateRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new TasksApi();

  const body = {
    // string | Unique identifier of the task
    id: task-1,
    // TaskUpdate | Partial task update payload
    taskUpdate: ...,
  } satisfies TaskServiceUpdateRequest;

  try {
    const data = await api.taskServiceUpdate(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` | Unique identifier of the task | [Defaults to `undefined`] |
| **taskUpdate** | [TaskUpdate](TaskUpdate.md) | Partial task update payload | |

### Return type

[**Task**](Task.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Task successfully updated |  -  |
| **400** | Invalid request body or path parameter |  -  |
| **404** | Task not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

