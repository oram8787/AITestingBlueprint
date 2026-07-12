package com.reqresapi.asserts;

import io.restassured.response.Response;

import static org.assertj.core.api.Assertions.assertThat;

public class AssertActions {

    public void verifyStatusCode(Response response, int expected) {
        assertThat(response.getStatusCode())
                .as("Status code mismatch")
                .isEqualTo(expected);
    }

    public void verifyStringEquals(String actual, String expected) {
        assertThat(actual).isNotNull().isNotBlank().isEqualTo(expected);
    }

    public void verifyNotNull(Object value) {
        assertThat(value).isNotNull();
    }

    public void verifyNotNullOrEmpty(String value) {
        assertThat(value).isNotNull().isNotBlank();
    }

    public void verifyIntGreaterThan(int actual, int threshold) {
        assertThat(actual).isGreaterThan(threshold);
    }
}
