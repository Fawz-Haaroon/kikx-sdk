export async function request(
  endpoint,
  {
    method = "GET",
    body = undefined,
    params = {},
    headers = {},
    ...options
  } = {}
) {
  try {
    const url = new URL(endpoint);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const isFormData = body instanceof FormData;

    const response = await fetch(url, {
      method,
      headers: {
        // Only set Content-Type for non-FormData bodies
        ...(body !== undefined &&
          !isFormData && {
            "Content-Type": "application/json"
          }),
        ...headers
      },

      ...(body !== undefined && {
        body: isFormData ? body : JSON.stringify(body)
      }),

      ...options
    });

    // Handle empty responses
    if (response.status === 204) {
      return {
        data: null,
        error: null
      };
    }

    const contentType = response.headers.get("content-type") || "";
    let result;

    if (contentType.includes("application/json")) {
      result = await response.json();
    } else if (contentType.includes("text/")) {
      result = await response.text();
    } else {
      result = await response.blob();
    }

    if (!response.ok) {
      return {
        data: null,
        error: {
          status: response.status,
          message:
            result?.detail ||
            result?.message ||
            `Request failed with status ${response.status}`,
          detail: result?.detail
        }
      };
    }

    return {
      data: result,
      error: null,
      contentType
    };
  } catch (error) {
    return {
      data: null,
      error: {
        status: null,
        message: error.message
      }
    };
  }
}

export async function fetchData(
  endpoint,
  {
    method = "GET",
    body = undefined,
    params = {},
    headers = {},
    ...options
  } = {}
) {
  const { data, error } = await request(endpoint, {
    method,
    body,
    params,
    headers,
    ...options
  });
  if (error) {
    throw new Error(error.detail || "Error fetching data");
  }

  return data;
}
