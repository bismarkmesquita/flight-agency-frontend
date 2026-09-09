import style from '@/auth/components/login-page/login-form/login-form.module.scss';
import {
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useState } from 'react';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { LoadingWrapper } from '@/base/components/loading-wrapper/loading-wrapper';
import { useAuthService } from '@/auth/services/auth';
import { useRouter } from 'next/navigation';
import { setAuth } from '@/auth/utils/auth';
import { useSnackbar } from '@/base/context/SnackbarContext';
import { UserRole } from '@/auth/enums/user-role';
import { DEMO_CREDENTIALS, LoginRole } from '@/auth/models/demo-credentials';

export type LoginFormInfo = {
  login: string;
  password: string;
  keep_connected: boolean;
};

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);
  const authService = useAuthService();
  const snackbar = useSnackbar();

  const [role, setRole] = useState<UserRole>(UserRole.SELLER);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormInfo>({
    defaultValues: {
      keep_connected: false,
    },
  });

  const onSubmit: SubmitHandler<LoginFormInfo> = async (data) => {
    setProcessing(true);
    const response = await authService.login(data);

    if (response.token) {
      setAuth(response);
      router.push('/');
    } else {
      setProcessing(false);
      snackbar.showSnackbar(response.message ?? 'Error logging in.', 'error');
    }
  };

  const handleRoleChange = (
    value: LoginRole | null
  ) => {
    if (!value) return;

    setRole(value);

    const credentials = DEMO_CREDENTIALS[value];

    setValue('login', credentials.login);
    setValue('password', credentials.password);
  };

  return (
    <LoadingWrapper loading={processing} className={style.loading}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={style.root}>
          <div className={style.welcome}>
            <span className={style.title}>Welcome Back</span>
            <span className={style.description}>Please enter your details to sign in</span>
          </div>
          <div className={style.demo}>
            <p>Login as a:</p>
            <ToggleButtonGroup
              fullWidth
              exclusive
              size='small'
              color="primary"
              className={style.toggleButtonGroup}
              value={role}
              onChange={(_, value) => value && handleRoleChange(value)}
            >
              <ToggleButton
                className={style.toggleButton}
                value={UserRole.MANAGER}
              >
                Manager
              </ToggleButton>
              <ToggleButton
                className={style.toggleButton}
                value={UserRole.SELLER}
              >
                Seller
              </ToggleButton>
            </ToggleButtonGroup>
            <span>Demo access — credentials will auto-fill</span>
          </div>
          <div className={style.input}>
            <p>Email Address</p>
            <Controller
              name='login'
              control={control}
              defaultValue=''
              rules={{ required: 'Email is required.' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  className={style.textField}
                  size='small'
                  variant='outlined'
                  placeholder='email@email.com'
                  onChange={field.onChange}
                  error={!!errors.login}
                  helperText={errors.login?.message}
                />
              )}
            />
          </div>
          <div className={style.input}>
            <p>Password</p>
            <Controller
              name='password'
              control={control}
              rules={{ required: 'Password is required.' }}
              defaultValue=''
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  className={style.textField}
                  size='small'
                  variant='outlined'
                  placeholder='********'
                  type={showPassword ? 'text' : 'password'}
                  onChange={field.onChange}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            aria-label={
                              showPassword ? 'hide password' : 'show password'
                            }
                            onClick={() => setShowPassword(!showPassword)}
                            edge='end'
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />
          </div>
          <Controller
            name='keep_connected'
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    {...field}
                    checked={field.value}
                    size='small'
                  />
                }
                label='Keep me logged in'
              />
            )}
          />
          <Button type='submit' variant='contained' color='primary'>
            Sign In
          </Button>
        </div>

      </form>
    </LoadingWrapper >
  );
}
