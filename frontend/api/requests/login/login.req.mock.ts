export default async function logInReqMock(email: string, password: string): Promise<string> {
  //return Promise.reject("Данный пользователь не зарегестрирован. Обратитесь к администратору");
  return Promise.resolve("1234555555555555555555");
}
