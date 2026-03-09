package edu.cit.daclan.medicore.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private T data;
    private ErrorDetail error;
    private String timestamp;

    public ApiResponse() {}

    public boolean isSuccess() { return success; }
    public T getData() { return data; }
    public ErrorDetail getError() { return error; }
    public String getTimestamp() { return timestamp; }
    public void setSuccess(boolean success) { this.success = success; }
    public void setData(T data) { this.data = data; }
    public void setError(ErrorDetail error) { this.error = error; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = true;
        r.data = data;
        r.timestamp = Instant.now().toString();
        return r;
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = false;
        r.error = new ErrorDetail(code, message, null);
        r.timestamp = Instant.now().toString();
        return r;
    }

    public static <T> ApiResponse<T> error(String code, String message, Object details) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = false;
        r.error = new ErrorDetail(code, message, details);
        r.timestamp = Instant.now().toString();
        return r;
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ErrorDetail {
        private String code;
        private String message;
        private Object details;

        public ErrorDetail() {}

        public ErrorDetail(String code, String message, Object details) {
            this.code = code;
            this.message = message;
            this.details = details;
        }

        public String getCode() { return code; }
        public String getMessage() { return message; }
        public Object getDetails() { return details; }
        public void setCode(String code) { this.code = code; }
        public void setMessage(String message) { this.message = message; }
        public void setDetails(Object details) { this.details = details; }
    }
}