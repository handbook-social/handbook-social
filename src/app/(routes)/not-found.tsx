import Link from 'next/link';
import { Navbar } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/Button';

const NotFoundPage = () => {
    return (
        <>
            <Navbar />
            <section className="mt-[56px] flex h-[calc(100vh-56px)] items-center p-16 dark:bg-dark-primary-1 dark:text-gray-800">
                <div className="container mx-auto my-8 flex flex-col items-center justify-center px-5">
                    <div className="max-w-md text-center dark:text-dark-primary-1">
                        <h2 className="mb-8 text-9xl font-extrabold dark:text-gray-400">
                            <span className="sr-only">Lỗi</span>404
                        </h2>
                        <p className="text-2xl font-semibold dark:text-dark-primary-1 md:text-3xl">
                            Xin lỗi, trang bạn đang tìm kiếm không tồn tại.
                        </p>

                        <Button className="mt-2" href="/" variant={'primary'}>
                            Quay lại trang chủ
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
};

export default NotFoundPage;
