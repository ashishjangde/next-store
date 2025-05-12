import {
    Global,
    Module 
} from '@nestjs/common';
import { JwtService } from './jwt.service';
import ConfigService from '../config/config.service';


@Global()
@Module({
    providers :[
        JwtService , ConfigService
    ],
    exports:[
        JwtService
    ]
})

export class JwtModule {}