import { useForm } from 'react-hook-form';
import { useCreatePost } from '../../hooks/useCreatePost';
import styles from './PostForm.module.css';

// 이미지 필드 추가: image?는 선택적(optional) 필드라는 뜻
// 사용자가 입력 안 해도 되고, 입력하면 string 타입이어야 함
interface PostFormData {
    content: string;
    image?: string;
}

function PostForm() {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<PostFormData>();
    const createPostMutation = useCreatePost();

    const onSubmit = (data: PostFormData) => {
        // 기존엔 { content: data.content }만 넘겼지만,
        // 이제 image도 함께 넘겨야 하므로 data 객체 전체를 그대로 전달
        // (data 타입이 PostFormData → content, image 둘 다 포함됨)
        createPostMutation.mutate(data, {
            onSuccess: () => {
                // 게시글 작성 성공 시 입력창(content, image 모두) 초기화
                reset();
            }
        });
    };

    return (
        <div className={styles.formContainer}>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <textarea
                    {...register('content', {
                        required: '내용을 입력하세요',
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

                {errors.content && (
                    <p className={styles.error}>{errors.content.message}</p>
                )}

                {/* 이미지 URL 입력 필드 (신규 추가) */}
                {/* register('image')에 별도 유효성 검사 규칙이 없음 → 선택 입력이라 required 등이 빠져 있음 */}
                <input
                    {...register('image')}
                    type="text"
                    placeholder="이미지 URL (선택)"
                    className={styles.imageInput}
                />

                <div className={styles.actions}>
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={createPostMutation.isPending}
                    >
                        {createPostMutation.isPending ? '게시 중...' : '게시'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default PostForm;