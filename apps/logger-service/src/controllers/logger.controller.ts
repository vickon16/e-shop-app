// import { AuthError, NotFoundError } from '@e-shop-app/packages/error-handler';
// import { getUserBy, sendSuccess } from '@e-shop-app/packages/utils';
// import { NextFunction, Request, Response } from 'express';

// get admin info
// export const getAdminInfoController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const authUser = req.user;
//     if (!authUser) {
//       throw new AuthError('Unauthorized');
//     }

//     const admin = await getUserBy('id', authUser.userId);

//     if (!admin || admin.role !== 'admin') {
//       throw new NotFoundError(`Admin not found`);
//     }

//     sendSuccess(res, admin, 'Admin retrieved successfully');
//   } catch (error) {
//     console.log('Error in getAdminController:', error);
//     return next(error);
//   }
// };
