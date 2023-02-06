import { notFoundError, notmatch } from "@/error";
import userRepository from "@/repositories/user-repositoy";

import { Addres, User } from "@prisma/client";
import bcrypt from "bcrypt";
import storeRepositoy from "@/repositories/store-repository";
import { shoops } from "@/config";

async function creatUser(user: CreateUserParams, url: string ) {
  const hashedPassword = await bcrypt.hash(user.password, 12);

  const userComplet = await userRepository.findFirstUserMail(user.email, url);

  user["password"] = hashedPassword;

  console.log(userComplet.StoreUser[0], "creat")
  if( userComplet.StoreUser[0] ) {
    const verify = userComplet.StoreUser.find((value) => {
      return userRepository.findFirstTableUserMail(userComplet.StoreUser[0].StoreId, value.UserId);
    });

    if(verify) throw notFoundError(); 
    
    await userRepository.creatStorUser({ StoreId: userComplet.StoreUser[0].StoreId, UserId: userComplet.StoreUser[0].UserId } );

    await userRepository.creatSessionUser(userComplet.StoreUser[0].UserId, user.password);
    
    delete user.email;
    delete user.password;
    delete user.owner;
    
    return { ...user, token: hashedPassword }; 
  }

  const shoop = await storeRepositoy.findFirsName(url);

  await userRepository.creatUser( user, shoop.id );
  delete user.email;
  delete user.password;
  delete user.owner;

  return { ...user, token: hashedPassword };
}

export type CreateUserParams = Omit<User, "id" >;

async function signinUser(emailPass: Omit<User, "id" | "name" | "urlImage">, url: string ) {
  const shoop = await storeRepositoy.findFirsName(url);

  const middle = await userRepository.findFirstUserMail(emailPass.email, url);

  if( !middle.StoreUser[0].UserId ) throw notmatch();
 
  const user = await userRepository.findFirstUserToken(middle.StoreUser[0].UserId, url)
 
  const password = user.StoreUser[0].User.password;

  if( !password ) throw notmatch();

  const isPasswordValid = await bcrypt.compare(emailPass.password, password);

  if(!isPasswordValid) throw notmatch();

  const hashedPassword = await bcrypt.hash(password, 12);
  
  await userRepository.creatSessionUser(middle.StoreUser[0].UserId, hashedPassword);
  
  return { name: user.StoreUser[0].User.name, urlImage: user.StoreUser[0].User.urlImage, token: hashedPassword };
}

async function autorize(UserId: number, nameStore: string) {
  const user = await userRepository.findFirstUserToken(UserId, nameStore);

  if( user.StoreUser.length === 0 || !user.StoreUser[0].User.owner) return false;
  
  return true; 
}

async function creatAddres(obj: Omit<Addres, "id">) {
  const user = await userRepository.creatAddres(obj);

  return true; 
}

const userService = {
  creatAddres,
  autorize,
  creatUser,
  signinUser
};

export default userService;
