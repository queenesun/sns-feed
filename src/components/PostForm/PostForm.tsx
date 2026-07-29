import { useForm } from 'react-hook-form';
import { useCreatePost } from '../../hooks/useCreatePost';
import styles from './PostForm.module.css';

interface PostFormData {
    content: string;
}

function PostForm() {
    // useForm<PostFormData>() : 이 폼이 PostFormData 타입의 데이터를 다룬다고 명시
    // register: input을 폼 상태에 등록시켜주는 함수 (유효성 검사 규칙도 여기서 같이 지정)
    // handleSubmit: 제출 시 유효성 검사를 통과한 데이터만 골라서 콜백 함수에 넘겨주는 래퍼 함수
    // formState.errors: 유효성 검사 실패 시 에러 메시지들이 담기는 객체
    // reset: 폼의 입력값을 초기 상태로 되돌리는 함수
    const { register, handleSubmit, formState: { errors }, reset } = useForm<PostFormData>();

    // 게시글 작성 요청(mutation)을 다루는 커스텀 훅
    // mutate, isPending(현재 요청 진행 중인지 여부) 등을 포함한 객체를 반환
    const createPostMutation = useCreatePost();

    // 폼 제출이 유효성 검사를 통과했을 때만 실행되는 함수
    // data: register로 등록된 필드들의 최종 입력값 (여기선 { content: string })
    const onSubmit = (data: PostFormData) => {
        createPostMutation.mutate(
            { content: data.content },  // mutationFn에 넘길 실제 인자
            {
                // 이 mutate 호출에 한정된 콜백 (useCreatePost 안의 onSuccess와 별개로 추가 실행됨)
                onSuccess: () => {
                    // 게시글 작성 성공 시 입력창을 비워서 다음 글을 바로 쓸 수 있게 함
                    reset();
                }
            }
        );
    };

    return (
        <div className={styles.formContainer}>
            {/* handleSubmit(onSubmit) : 폼 제출(submit) 이벤트가 발생하면
                1) 먼저 register에 설정된 유효성 검사 규칙을 검사하고
                2) 통과한 경우에만 onSubmit(data)를 실행 */}
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <textarea
                    // register('content', { 유효성 검사 규칙 })
                    // 스프레드(...)로 register가 반환하는 onChange, onBlur, ref 등을 textarea에 그대로 전개
                    {...register('content', {
                        required: '내용을 입력하세요',   // 필수 입력 (비어있으면 이 메시지 표시)
                        minLength: {
                            value: 1,
                            message: '최소 1자 이상 입력하세요'
                        },
                        maxLength: {
                            value: 500,
                            message: '최대 500자까지 입력 가능합니다'
                        }
                    })}
                    placeholder="무슨 생각을 하고 계신가요?"
                    className={styles.textarea}
                    rows={3}
                />

                {/* errors.content가 있을 때만(유효성 검사 실패 시) 에러 메시지 렌더링 */}
                {errors.content && (
                    <p className={styles.error}>{errors.content.message}</p>
                )}

                <div className={styles.actions}>
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        // 요청이 진행 중(isPending)일 때는 버튼 비활성화 → 중복 제출 방지
                        disabled={createPostMutation.isPending}
                    >
                        {/* 요청 진행 상태에 따라 버튼 텍스트를 다르게 표시 */}
                        {createPostMutation.isPending ? '게시 중...' : '게시'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default PostForm;