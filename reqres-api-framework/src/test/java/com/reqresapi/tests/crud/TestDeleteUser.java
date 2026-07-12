package com.reqresapi.tests.crud;

import com.reqresapi.base.BaseTest;
import com.reqresapi.endpoints.APIConstants;
import io.qameta.allure.Description;
import io.qameta.allure.Owner;
import io.restassured.RestAssured;
import org.testng.annotations.Test;

public class TestDeleteUser extends BaseTest {

    @Test(priority = 1)
    @Owner("oram2062@gmail.com")
    @Description("TC#DELETE01 - Delete user ID 2 and verify 204 No Content")
    public void testDeleteUser() {
        response = RestAssured.given(requestSpec)
                .basePath(APIConstants.USERS_URL + "/2")
                .when().delete();

        validatableResponse = response.then().log().all();
        assertActions.verifyStatusCode(response, 204);
    }
}
