enum UserEnumType {
    GlobalAdmin = 1,
    LocalAdmin = 2,
    Doctor = 3,
    Patient = 4,
}

export const userFilterValues = [
    {
        id: UserEnumType.LocalAdmin,
        text: "Local admin",
    },
    {
        id: UserEnumType.Patient,
        text: "Patient",
    },
    {
        id: UserEnumType.Doctor,
        text: "Doctor",
    },
];
export default UserEnumType;