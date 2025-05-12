import { Controller, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  

  async getUserProfile(@Req() req, @Res() res: Response) {
    
  };

  async updateUserProfile(@Req() req, @Res() res: Response) {
  };

  async updateProfilePicture(@Req() req, @Res() res: Response) {
  };

  async chnagePassword(@Req() req, @Res() res: Response) {
  }

  async deleteAccount(@Req() req, @Res() res: Response) {
  };

  // async getUserById(@Req() req, @Res() res: Response) {
  // };

  // async getUserByEmail(@Req() req, @Res() res: Response) {
  // };



}
