import UserService from "@repo/services/user";
import FormService from "@repo/services/form";
import FormFieldService from "@repo/services/form-field"; // Add this import

export const userService = new UserService();
export const formService = new FormService();
export const formFieldService = new FormFieldService(); // Expose the service