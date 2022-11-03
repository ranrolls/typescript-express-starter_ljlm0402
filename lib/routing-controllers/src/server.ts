import App from '@/app';
import { AuthController, IndexController, UsersController,
    BasicsController, FileController, FormsController, StreamController,
    ChildProcessController, CryptoController
    } from '@controllers/all'
import validateEnv from '@utils/validateEnv';
validateEnv();
const app = new App([
    AuthController, IndexController, UsersController,
    BasicsController, FileController, FormsController,
    StreamController, ChildProcessController,
    CryptoController
]);

app.listen();