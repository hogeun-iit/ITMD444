# StatisticsApi

All URIs are relative to *https://itmd444-assignment4-task.onrender.com*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**taskServiceStats**](StatisticsApi.md#taskservicestats) | **GET** /stats | Get task statistics |



## taskServiceStats

> TaskStats taskServiceStats()

Get task statistics

Returns aggregated task statistics including total task count, completed task count, overdue task count, average estimated hours, and a breakdown of tasks by status. 

### Example

```ts
import {
  Configuration,
  StatisticsApi,
} from '';
import type { TaskServiceStatsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new StatisticsApi();

  try {
    const data = await api.taskServiceStats();
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

[**TaskStats**](TaskStats.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successfully retrieved task statistics |  -  |
| **400** | Bad request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

