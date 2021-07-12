$(function () {

    // эмуляция удаления анкеты и удаления аккаунта (выводим модальное окно, как будто бы анкета или аккаунт удалены)
    $('.js_btn_del').on('click', function () {
        $('.js_data_del_modal').removeClass('active');
        $('.js_data_del_done_modal').addClass('active');
    });

    $('.js_btn_acc_del').on('click', function () {
        $('.js_acc_del_modal').removeClass('active');
        $('.js_acc_del_done_modal').addClass('active');
    });


    //время cессии истекло
    let idleTime = 0;

    let idleInterval = setInterval(timerIncrement, 60000); // 1 минута

    $(this).on('mousemove', function (e) {  //обнуляем таймер при движении мыши или набора c клавиатуры
        idleTime = 0;
    });
    $(this).on('keypress', function (e) {
        idleTime = 0;
    });

    function timerIncrement() {
        idleTime = idleTime + 1;
        if (idleTime > 59) { // 60 минут
            // get-запрос
            $.get('test.json', function (data) {
                $('.js_modal_timeout').addClass('active');
            });
        }
    }

    // работа c cookie
    function getCookie(name) {     //данная ф-ция возвращает cookie если есть или undefined
        let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    if (getCookie('status') == undefined) {    // проверяем на наличие куки с именем 'status', если его нет (т. е. undefined) то показуем модальное окно, если же оно есть то окно не будет показано
        $('.cookies').show();
        $('.cookies__btn').on('click', function () {       // при нажатии на кнопку закрытия модального окна (крестик), устанавливаем куки 'status=installed'
            document.cookie = "status=installed;max-age=31556926";   // max-age устанавливает время жизни куки в секундах на 1год
        });
    };

    // удаление всех кук сайта (оставлял для тестирования, можно удалить)
    // let cookies = document.cookie.split(/;/);
    // for (let i = 0, len = cookies.length; i < len; i++) {
    //     let cookie = cookies[i].split(/=/);
    //     document.cookie = cookie[0] + "=;max-age=-1";
    // }

    // прикрепление файла
    $('.js_upload_field').on('click', function () {
        $('.js_upload_input').trigger('click');
    });

    let maxFileSize = 10 * 1024 * 1024, // (байт) максимальный размер файла (10мб)
        queue = {},
        uploadsList = $('.js_upload_list'),
        itemPreviewTemplate = uploadsList.find('.js_file').detach();   // 'detach' подобно 'clone + remove'

    function limitUpload() {   // вычисление лимита прикрепляемых файлов, в нашем случае не больше 10
        return 10 - uploadsList.children().length;
    }

    $('.js_upload_input').on('change', function () {
        let files = this.files;
        for (let z = 0; z < limitUpload(); z++) {          // перебор файлов до лимита
            let file = files[z];
            if (file.size > maxFileSize) {
                alert('Размер файла не должен превышать 10 Мб');
                continue;
            };
            preview(files[z]);  // сама ф-ция находится ниже
        }
        this.value = '';
    });

    function preview(file) {
        let reader = new FileReader();
        reader.addEventListener('load', function () {

            let itemPreview = itemPreviewTemplate.clone();
            itemPreview.find('.js_file_name').text(file.name);

            let rounded = function (number) {    // ф-ция для округления размера файлов
                return +number.toFixed(1);
            }

            itemPreview.find('.js_file_size').text(rounded(file.size / 1024) + ' KB');
            itemPreview.data('id', file.name);
            uploadsList.append(itemPreview);

            $(itemPreview.find('.js_file_remove')).on('click', function () {   //   обработчик удаления
                delete queue[file.name];
                $(this).parent().remove();
                if (limitUpload() == 10 && $('.js_chat_textarea').val() == "") {  //

                    $('.js_chat_btn').prop('disabled', true); //дизабл кнопке, если не набран текст и не прикреплён файл
                }
            });

            queue[file.name] = file;
            if (limitUpload() < 10) {
                $('.js_chat_btn').prop('disabled', false); //убираем дизабл у кнопки, если прикреплён файл
            }
        });
        reader.readAsDataURL(file);
    }

    // меняем цвет кнопки отправки в чате, если в поле для сообщения что-то набрано
    $('.js_chat_textarea').on(('input'), function () {
        if ($(this).val() != 0 || limitUpload() < 10) {   // ф-ция limitUpload() взята из скрипта выше
            $('.js_chat_btn').prop('disabled', false);
        } else {
            $('.js_chat_btn').prop('disabled', true);
        }
    });

    //отправка сообщения чата
    // $('.js_chat_form').on('submit', function (e) {
    //     e.preventDefault();

    // $.ajax({
    //   type: "POST",
    //   url: "",
    //   data: $(this).serialize()

    // }).done(function () {
    //     $(this).find("textarea").val("");
    //     $('form').trigger('reset');
    //     $('.js_file').remove();
    // });
    // return false;
    // });

    // подключение плагина 'jquery autocomplete'
    let cardRules = [];      // создаём новый массив

    $.get('cities/cities.txt', function (data) {  // cities.txt - файл с названиями городов

        cardRules = data.split('\n');          // записуем города из файла в массив
        $('.js_city_input').autocomplete({     // инициализация плагина
            source: cardRules
        });

    });

    // бургер меню
    $('.js_hamburger').on('click', function () {
        $('.js_hamburger, .menu__block, .js_menu_overlay').toggleClass('active');
    });

    $('.menu__link, .js_menu_overlay').on('click', function () {
        $('.js_hamburger, .menu__block, .js_menu_overlay').removeClass('active');
    });

    // кнопка показать-скрыть пароль
    $('.js_show_pass_btn').on('click', function () {

        const input = $(this).next();

        if (input.attr('type') == 'password') {
            input.attr('type', 'text');
            $(this).addClass('view');
        } else {
            input.attr('type', 'password');
            $(this).removeClass('view');
        }
        return false;
    });

    // смена капчи по клику на кнопку
    let images = [ // массив с капчами (картинками)
        "captcha-1.jpg",
        "captcha-2.jpg"
    ],
        index = 1; // индекс (порядковый номер) элемента в массиве;

    $('.js_cpatcha_btn').on('click', function () {
        if (index == images.length) {
            index = 0;
        }
        let image = images[index++];
        $('.js_captcha_img').attr('src', 'images/' + image);
    });

    // переключатель (свитчер) на странице 'мои данные'
    $('.js_toggle_checkbox').on('click', function () {
        $('.my-data__form').slideToggle();
    });

    // кнопка наверх, находится в футере 
    $(".js_btn_up").on('click', function () {
        $("html, body").animate({ scrollTop: 0 }, 500);
    });

    // открытие модальных окон по клику на блоки с красной иконкой на странице пациенты (заполнено)
    $('.js_data_warning_me').on('click', function () {
        $(".js_modal_data_me").addClass('active');
    });

    $('.js_data_warning_child').on('click', function () {
        $(".js_modal_data_child").addClass('active');
    });

    // кнопка закрытия модального окна
    $(".js_btn_close").on('click', function () {
        $(this).parents(".animate-modal").removeClass('active');
    });

    //показываем всплывающие картинки по клику на странице 'вопросы регистра' на ширине менее 640px,
    // от 640 и выше будет ховер
    if (window.innerWidth < 640) {
        $('.js_quiz_icon').on('click', function () {
            $(this).next('.quiz__popup-inner').addClass('active');
        });
    }

    $('.js_quiz_popup_btn').on('click', function () {
        $('.quiz__popup-inner').removeClass('active');
    });

    // аккордеон на странице 'вопросы и ответы'
    $('.js_title').on('click', function () {
        $(this).toggleClass('active').next().slideToggle(300);
    });

    // скрипт для стилизации прогрессбаров на странице c заполненными анкетами
    $('.js_data_progress').each(function () {
        // percent = parseFloat($(this).text()); 
        percent = parseFloat($(this).children('.js_data_progress_val').css('width'));
        if (percent == 0) {
            $(this).next().addClass('white');
        } else if (percent > 0 && percent < 100) {
            $(this).addClass('yellow');
        } else {
            $(this).addClass('green');
        }
    });

    // показываем модальное окно при нажатии на ссылку 'удалить аккаунт' на странице 'мои данные'
    $('.js_my_data_del_link').on('click', function (e) {
        e.preventDefault();
        $('.js_acc_del_modal').addClass('active');
    });

    // показываем модальное окно при нажатии на значок корзины на странице 'пациенты(заполнено)'
    $('.js_data_del_icon').on('click', function (e) {
        e.preventDefault();
        $('.js_data_del_modal').addClass('active');
    });

    // условие показа модального окна 'ошибка - гражданство не РФ'
    $('.js_citizen_other').on('change', function () {
        $('.js_modal_citizen').addClass('active');
    });

    $('.js_modal_citizen_btn').on('click', function () {
        $('.js_citizen_other').prop('checked', false);
        $('.js_citizen_ru').focus();
        $('.js_modal_citizen').removeClass('active');
    });

    //подключение плагина: маска для даты
    $('.js_questions_date, .js_questions_date_child').mask('99.99.9999');

    // условия показа модальных окон 'ошибка - пользователю нет 18' и 'ребёнку есть 18'
    let newDate = new Date(),                           // определяем, какая сегодня дата
        newDay = newDate.getDate(),                     // определяем, какое сегодня число
        newMonth = newDate.getMonth() + 1,              // определяем, какой сегодня месяц
        newYear = newDate.getFullYear(),                // определяем, какое сегодня год
        testYear = newYear - 18;                        // получаем число (год), с которым будем сравнивать год рождения пользователя

    $('.js_questions_date').on('change', function () {

        let userDate = $(this).val(),                   // дата рождения пользователя
            userDay = +userDate.substring(0, 2),        // число рождения пользователя
            userMonth = +userDate.substring(3, 5),      // месяц рождения пользователя
            userYear = +userDate.substring(6, 10);      // год рождения пользователя

        if (userYear > testYear) {
            $('.js_modal_no_18').addClass('active');
        } else if (userYear == testYear && userMonth > newMonth) {
            $('.js_modal_no_18').addClass('active');
        } else if (userYear == testYear && userMonth == newMonth && userDay > newDay) {
            $('.js_modal_no_18').addClass('active');
        }
    });

    $('.js_modal_no_18_btn').on('click', function () {
        $('.js_questions_date').val("").focus();
        $('.js_modal_no_18').removeClass('active');
    });

    $('.js_questions_date_child').on('change', function () {

        let childDate = $(this).val(),                   // дата рождения ребенка
            childDay = +childDate.substring(0, 2),        // число рождения ребенка
            childMonth = +childDate.substring(3, 5),      // месяц рождения ребенка
            childYear = +childDate.substring(6, 10);      // год рождения ребенка

        if (childYear < testYear) {
            $('.js_modal_18').addClass('active');
        } else if (childYear == testYear && childMonth < newMonth) {
            $('.js_modal_18').addClass('active');
        } else if (childYear == testYear && childMonth == newMonth && childDay < newDay) {
            $('.js_modal_18').addClass('active');
        }

        $('.js_modal_18_btn').on('click', function () {
            $('.js_questions_date_child').val("").focus();
            $('.js_modal_18').removeClass('active');
        });

    });


    // валидация форм, для валидации используется плагин 'jQuery Validation Plugin', ссылка: https://jqueryvalidation.org/

    // валидация формы на странице 'вход в личный кабинет'
    $('.js_login_form').validate({
        rules: {
            email: {
                required: true,
            },
            password: {
                required: true,
                minlength: 6
            },
            captcha: {
                required: true,
            }
        },
        messages: {
            email: {
                required: "Пользователь с такой эл. почтой не найден"
            },
            password: {
                required: "Неверный пароль",
                minlength: jQuery.validator.format("Введите {6} символ!")
            },
            captcha: {
                required: "Неверный код"
            }
        },
        submitHandler: function () {
            $('.js_login_form').find("input").val("");
        }
    });

    // валидация формы на странице 'регистрация'
    $('.js_registration_form').validate({
        rules: {
            email: {
                required: true
            },
            password: {
                required: true,
                minlength: 6
            },
            password_again: {
                required: true,
                minlength: 6,
                equalTo: ".js_password"
            },
            check: {
                required: true
            }
        },
        messages: {
            email: {
                required: "Пользователь с такой эл. почтой уже есть в системе. <a href='#'>Восстановить доступ?</a>"
            },
            password: {
                required: "Обязательное поле",
                minlength: jQuery.validator.format("Введите {0} символов!")
            },
            password_again: {
                required: "Обязательное поле",
                minlength: jQuery.validator.format("Введите {0} символов!"),
                equalTo: "Пароли не совпадают"
            },
            check: {
                required: "Обязательное условие"
            }
        },
        errorPlacement: function (error, element) {
            if (element.attr("type") == "checkbox") {
                error.insertAfter(".checkbox__label");
            } else {
                error.insertAfter(element);
            }
        },
        submitHandler: function () {
            $('.js_registration_form').find('input, textarea').val("");
            $('.js_registration_form').hide();
            $('.js_form_text').fadeIn(500);
        }
    });

    // валидация формы на странице 'восстановление пароля'
    $('.js_recovery_form').validate({
        rules: {
            email: {
                required: true
            }
        },
        messages: {
            email: {
                required: "Пользователь с такой эл. почтой не найден"
            }
        },
        submitHandler: function () {
            $('.js_recovery_form').find("input").val("");
            $('.js_recovery_form').hide();
            $('.js_form_text').fadeIn(500);
        }
    });

    // валидация формы на странице 'изменение пароля'
    $('.js_pass_ch_form').validate({
        rules: {
            password: {
                required: true,
                minlength: 6
            },
            password_again: {
                required: true,
                minlength: 6,
                equalTo: ".js_password"
            },
        },
        messages: {
            password: {
                required: "Обязательное поле",
                minlength: jQuery.validator.format("Введите {0} символов!")
            },
            password_again: {
                required: "Обязательное поле",
                minlength: jQuery.validator.format("Введите {0} символов!"),
                equalTo: "Пароли не совпадают"
            }
        },
        submitHandler: function () {
            $('.js_pass_ch_form').find("input").val("");
            $('.js_pass_ch_form').hide();
            $('.js_form_text').fadeIn(500);
        }
    });

    // валидация формы на странице 'мои данные'
    $.validator.addMethod('customphone', function (value, element) {    //добавляем свой метод (см. док-цию плагина) 
        return this.optional(element) || /^(\s*)?(\+)?([- _():=+]?\d[- _():=+]?){1,30}(\s*)?$/.test(value); // регулярное выражение для телефона
    }, "Поле может содержать только цифры");

    $('.js_my_data_form').validate({
        rules: {
            name: {
                required: true
            },
            email: {
                required: true,
                email: true
            },
            phone: {
                maxlength: 30,
                customphone: true
            }
        },
        messages: {
            name: {
                required: "Обязательное поле"
            },
            email: {
                required: "Обязательное поле",
                email: "Некорректный Email"
            },
            phone: {
                required: "Обязательное поле",
                maxlength: "Масксимум 30 символов"
            }
        },
        focusInvalid: false,
        invalidHandler: function (form, validator) {
            if (!validator.numberOfInvalids())
                return;
            // плавная прокрутка вверх к первой ошибке
            $('html, body').animate({
                scrollTop: $(validator.errorList[0].element).offset().top - 140
            }, 500);
        },
        submitHandler: function () {
            $('.js_my_data_modal').addClass('active');
            $('.my-data__btn').prop('disabled', true);
            $('.js_my-data_input').on('keyup', function () {
                $('.my-data__btn').prop('disabled', false);
            });
        }
    });

    // валидация формы на странице 'новое обращение'
    $('.js_support_form').validate({
        rules: {
            theme: {
                required: true
            },
            message: {
                required: true
            }
        },
        messages: {
            theme: {
                required: "Обязательное поле"
            },
            message: {
                required: "Обязательное поле"
            }
        },
        focusInvalid: false,
        invalidHandler: function (form, validator) {
            if (!validator.numberOfInvalids())
                return;
            // плавная прокрутка вверх к первой ошибке
            $('html, body').animate({
                scrollTop: $(validator.errorList[0].element).offset().top - 140
            }, 500);
        },
        submitHandler: function () {
            $('.js_support_form').find('input, textarea').val("");
            $('.js_support_form').hide();
            $('.js_support_form_success').fadeIn(500);
        }
    });

    // валидация формы на странице 'сменить пароль'
    $('.js_page_change_form').validate({
        rules: {
            password: {
                required: true,
                minlength: 6
            },
            password_new: {
                required: true,
                minlength: 6
            },
            password_new_again: {
                required: true,
                minlength: 6,
                equalTo: ".js_password_new"
            }
        },
        messages: {
            password: {
                required: "Обязательное поле",
                minlength: jQuery.validator.format("Введите {0} символов!")
            },
            password_new: {
                required: "Обязательное поле",
                minlength: jQuery.validator.format("Введите {0} символов!")
            },
            password_new_again: {
                required: "Обязательное поле",
                minlength: jQuery.validator.format("Введите {0} символов!"),
                equalTo: "Пароли не совпадают"
            }
        },
        focusInvalid: false,
        invalidHandler: function (form, validator) {
            if (!validator.numberOfInvalids())
                return;
            // плавная прокрутка вверх к первой ошибке
            $('html, body').animate({
                scrollTop: $(validator.errorList[0].element).offset().top - 140
            }, 500);
        },
        submitHandler: function () {
            $('.js_page_change_form').find("input").val("");
            $('.js_page_change_form').hide();
            $('.js_page_change_success').fadeIn(500);
        }
    });

    // кастомизация и настройка селекта                  
    $('select').niceSelect(); // подключаем плагин для стилизации элементов select                           

    $('.nice-select').on('focus', function () { //при фокусе добавляем класс плейсхолдеру (пднимаем его наверх)
        $('.questions__holder').addClass('active');
    });

    $('.js_questions_select').on('change', function () { //отслеживаем изменение значения элемента select
        $(this).removeClass('error');                    //убираем классы оишбок валидатора, чтоб убрать красный цвет селекта
        $('#country-error').remove();
        if ($('.js_questions_select').val() == 'ru') {         //если выбранная страна Россия, то появляется input с выбором города
            $('.js_residence_field').fadeIn(300);
        } else {
            $('.js_city_input').val('');
            $('.js_residence_field').fadeOut(300);
        }
    });

    $('.nice-select').on('blur', function () {   //при потере фокуса и не выбранном ни одном пункте убираем класс у плейсхолдера
        if ($('.js_questions_select').val() == "") {
            $('.questions__holder').removeClass('active');
        }
    });

    // валидация формы на странице 'анкета пациента'
    $('.js_questions_form').validate({
        rules: {
            gender: {
                required: true
            },
            first_name: {
                required: true
            },
            last_name: {
                required: true
            },
            patronymic: {
                required: true
            },
            date: {
                required: true,
            },
            citizen: {
                required: true
            },
            country: {
                required: true
            },
            city: {
                required: true
            },
            confirm: {
                required: true
            }

        },
        messages: {
            gender: {
                required: "Обязательное поле"
            },
            first_name: {
                required: "Обязательное поле"
            },
            last_name: {
                required: "Обязательное поле"
            },
            patronymic: {
                required: "Обязательное поле"
            },
            date: {
                required: "Обязательное поле"
            },
            citizen: {
                required: "Обязательное поле"
            },
            country: {
                required: "Обязательное поле"
            },
            city: {
                required: "Обязательное поле"
            },
            confirm: {
                required: "Обязательное условие"
            }
        },
        focusInvalid: false,
        invalidHandler: function (form, validator) {
            if (!validator.numberOfInvalids())
                return;
            // плавная прокрутка вверх к первой ошибке
            $('html, body').animate({
                scrollTop: $(validator.errorList[0].element).offset().top - 140
            }, 500);
        },
        errorPlacement: function (error, element) {
            // перемещаем сообщение об ошибке в нужное нам место нам странице
            $(element).each(function () {
                if (element.attr("type") == "radio" || element.attr("type") == "checkbox") {
                    error.insertAfter($(this).parent());
                } else if (element.hasClass("js_questions_select")) {
                    error.insertAfter($('.nice-select'));
                } else {
                    error.insertAfter(element);
                }
            });
        },
        submitHandler: function () {
            $('.js_policy').addClass('active');               // показать модальное окно 'политика обработки'
            $('.js_policy_btn').on('click', function () {
                // тут отправка формы
                $('.js_policy').removeClass('active');               // скрыть модальное окно 'политика обработки'
                // $('.js_questions_form').trigger('reset');         // сбросить значения полей формы
                // $('.nice-select .current').text('');              // сбросить значение кастомного select
                // $('.questions__holder').removeClass('active');    // вернуть плейсхолдер кастомного select в изначальное положение
            });
        }
    });

    // вопросы регистра (квиз)
    //добавление набора полей по клику на странице 'вопросы регистра'
    let quizBlock = 1;        //счётчик набора полей

    $('.js_quiz_btn_add').on('click', function () {
        $('.js_quiz_block').eq(quizBlock).fadeIn();
        quizBlock++;
    });

    // чекаем чекбокс 'другое' перед полем 'комментарий' при наборе текста на странице 3-его вопроса, если вдруг пользователь его не чекнул
    $('.js_quiz_comment').on('input', function () {
        if ($(this).val() != 0) {
            $('.js_checkbox_other').prop('checked', true);
        } else {
            $('.js_checkbox_other').prop('checked', false);
        }
    });

    // функкция для валидации вопросов опросника (квиза)
    function valideQuiz(form, path) {
        $(form).validate({
            rules: {
                type: {
                    required: true
                },
                doctor: {
                    required: true
                },
                sign: {
                    required: true
                },
                other_comment: {
                    required: false
                },
                name: {
                    required: false
                },
                symptom: {
                    required: false
                },
                result: {
                    required: false
                },
                comments: {
                    required: true
                }
            },
            messages: {
                type: {
                    required: "Выберите один вариант ответа"
                },
                doctor: {
                    required: "Выберите один вариант ответа"
                },
                sign: {
                    required: "Отметьте один или несколько вариантов"
                },
                comments: {
                    required: "Оставьте комментарий"
                }
            },
            focusInvalid: false,   //отменяем фокус к полю с ошибкой
            errorPlacement: function (error, element) {
                // перемещаем сообщение об ошибке в нужное нам место нам странице
                error.prependTo($('.quiz__buttons'));
            },
            submitHandler: function () {
                // $(form).trigger('reset');         // сбросить значения полей формы
                window.location.href = path;
            }
        });
    };

    valideQuiz('.js_quiz_form_1', 'quiz-step-2.html');
    valideQuiz('.js_quiz_form_2', 'quiz-step-3.html');
    valideQuiz('.js_quiz_form_3', 'quiz-step-4.html');
    valideQuiz('.js_quiz_form_4', 'quiz-step-5.html');
    valideQuiz('.js_quiz_form_5', 'quiz-step-6.html');

    // автоматическое увеличение высоты textarea при переполнении текстом
    $('textarea').on('input', function () {
        this.style.height = "5px";
        this.style.height = (this.scrollHeight) + "px";
    });

    // автоматическая прокрутка чата к последнему сообщению, код должен находится в самом низу js-файла
    $('.js_chat_body').animate({
        scrollTop: $('.js_chat_body').get(0).scrollHeight
    }, 0);

});